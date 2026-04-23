<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private Client $client;
    private string $apiKey;
    private string $model;
    private string $visionModel;
    private string $baseUrl = 'https://api.groq.com/openai/v1';

    public function __construct()
    {
        $this->client = new Client(['timeout' => 60]);
        $this->apiKey = config('services.groq.key');
        $this->model = config('services.groq.model', 'llama-3.3-70b-versatile');
        $this->visionModel = config('services.groq.vision_model', 'meta-llama/llama-4-scout-17b-16e-instruct');
    }

    public function detectIngredients(string $base64Image, string $mimeType = 'image/jpeg'): array
    {
        $prompt = "Look at this fridge/food image carefully. List ALL visible food ingredients, vegetables, fruits, meats, dairy, condiments, and pantry items you can see. Return ONLY a JSON array of ingredient names in English, like: [\"tomatoes\", \"eggs\", \"cheese\"]. Be thorough and specific.";

        $response = $this->generateWithImage($prompt, $base64Image, $mimeType);

        preg_match('/\[.*?\]/s', $response, $matches);
        if (!empty($matches[0])) {
            $ingredients = json_decode($matches[0], true);
            return is_array($ingredients) ? $ingredients : [];
        }

        return [];
    }

    public function generateRecipes(array $ingredients, array $profile): array
    {
        $dietaryNotes = $this->buildDietaryContext($profile);
        $ingredientList = implode(', ', $ingredients);

        $prompt = <<<PROMPT
You are a culturally-aware chef AI helping low-income families cook smart meals.

Available ingredients: {$ingredientList}

Dietary profile:
{$dietaryNotes}

Generate 3 complete recipes using ONLY the available ingredients (you can assume basic pantry items like salt, oil, water, sugar, flour, basic spices are available).

Return ONLY valid JSON in this exact format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "title_ar": "اسم الوصفة",
      "description": "Brief description",
      "description_ar": "وصف مختصر",
      "cuisine": "international",
      "prep_time": 15,
      "cook_time": 30,
      "servings": 4,
      "calories_per_serving": 350,
      "protein_g": 20.5,
      "carbs_g": 40.0,
      "fat_g": 10.0,
      "fiber_g": 5.0,
      "is_halal": false,
      "is_vegetarian": false,
      "is_vegan": false,
      "is_ramadan_friendly": false,
      "tags": ["tag1", "tag2"],
      "ingredients": [
        {"name": "ingredient", "amount": "2", "unit": "cups"}
      ],
      "steps": [
        "Step 1: Do this...",
        "Step 2: Then do this..."
      ],
      "steps_ar": [
        "الخطوة 1: ...",
        "الخطوة 2: ..."
      ]
    }
  ]
}
PROMPT;

        $response = $this->generateText($prompt);

        preg_match('/\{.*\}/s', $response, $matches);
        if (!empty($matches[0])) {
            $data = json_decode($matches[0], true);
            return $data['recipes'] ?? [];
        }

        return [];
    }

    public function generateSingleRecipe(string $recipeName, string $cuisine, array $profile): ?array
    {
        $dietaryNotes = $this->buildDietaryContext($profile);

        $prompt = <<<PROMPT
Generate a complete authentic {$cuisine} recipe for "{$recipeName}".

Dietary requirements:
{$dietaryNotes}

Return ONLY valid JSON:
{
  "title": "{$recipeName}",
  "title_ar": "Arabic name",
  "description": "Brief description",
  "description_ar": "Arabic description",
  "cuisine": "{$cuisine}",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "calories_per_serving": 350,
  "protein_g": 20.5,
  "carbs_g": 40.0,
  "fat_g": 10.0,
  "fiber_g": 5.0,
  "is_halal": true,
  "is_vegetarian": false,
  "is_vegan": false,
  "is_ramadan_friendly": false,
  "tags": [],
  "ingredients": [
    {"name": "ingredient", "amount": "2", "unit": "cups"}
  ],
  "steps": ["Step 1...", "Step 2..."],
  "steps_ar": ["الخطوة 1...", "الخطوة 2..."]
}
PROMPT;

        $response = $this->generateText($prompt);

        preg_match('/\{.*\}/s', $response, $matches);
        if (!empty($matches[0])) {
            return json_decode($matches[0], true);
        }

        return null;
    }

    private function buildDietaryContext(array $profile): string
    {
        $notes = [];
        if (!empty($profile['cultural_background'])) {
            $notes[] = "Cultural background: " . $profile['cultural_background'];
        }
        if (!empty($profile['is_halal'])) $notes[] = "Must be HALAL (no pork, no alcohol)";
        if (!empty($profile['is_vegetarian'])) $notes[] = "Must be VEGETARIAN (no meat or fish)";
        if (!empty($profile['is_vegan'])) $notes[] = "Must be VEGAN (no animal products)";
        if (!empty($profile['ramadan_mode'])) $notes[] = "Ramadan friendly (good for iftar/suhoor)";
        if (!empty($profile['allergies'])) {
            $notes[] = "Allergies to avoid: " . implode(', ', $profile['allergies']);
        }
        return implode("\n", $notes);
    }

    private function generateText(string $prompt): string
    {
        try {
            $response = $this->client->post("{$this->baseUrl}/chat/completions", [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'model'       => $this->model,
                    'messages'    => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.7,
                    'max_tokens'  => 8192,
                ],
            ]);
            $body = json_decode($response->getBody(), true);
            return $body['choices'][0]['message']['content'] ?? '';
        } catch (GuzzleException $e) {
            Log::error('Groq API error: ' . $e->getMessage());
            return '';
        }
    }

    private function generateWithImage(string $prompt, string $base64Image, string $mimeType): string
    {
        try {
            $response = $this->client->post("{$this->baseUrl}/chat/completions", [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'model'    => $this->visionModel,
                    'messages' => [[
                        'role'    => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => [
                                'url' => "data:{$mimeType};base64,{$base64Image}",
                            ]],
                        ],
                    ]],
                    'temperature' => 0.3,
                    'max_tokens'  => 1024,
                ],
            ]);
            $body = json_decode($response->getBody(), true);
            return $body['choices'][0]['message']['content'] ?? '';
        } catch (GuzzleException $e) {
            Log::error('Groq Vision API error: ' . $e->getMessage());
            return '';
        }
    }
}
