<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function scanFridge(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
            'mime_type' => 'nullable|string',
        ]);

        $ingredients = $this->gemini->detectIngredients(
            $request->image,
            $request->mime_type ?? 'image/jpeg'
        );

        return response()->json(['ingredients' => $ingredients]);
    }

    public function generateRecipes(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*' => 'string',
            'filters' => 'nullable|array',
        ]);

        $user = $request->user();
        $profile = array_merge(
            $user?->profile?->toArray() ?? [],
            $request->input('filters', [])
        );

        $recipes = $this->gemini->generateRecipes($request->ingredients, $profile);

        if (empty($recipes)) {
            return response()->json([
                'message' => 'AI service failed to generate recipes. Please try again in a moment.',
            ], 503);
        }

        $saved = [];
        foreach ($recipes as $recipeData) {
            if (!empty($recipeData['title'])) {
                try {
                    $recipe = Recipe::create(array_merge($recipeData, [
                        'user_id' => $user?->id,
                        'is_ai_generated' => true,
                    ]));
                    $saved[] = $recipe;
                } catch (\Exception $e) {
                    Log::error('Failed to save recipe: ' . $e->getMessage(), ['recipe' => $recipeData]);
                }
            }
        }

        if (empty($saved)) {
            return response()->json([
                'message' => 'Recipes were generated but could not be saved. Check the server logs.',
            ], 500);
        }

        return response()->json(['recipes' => $saved]);
    }
}
