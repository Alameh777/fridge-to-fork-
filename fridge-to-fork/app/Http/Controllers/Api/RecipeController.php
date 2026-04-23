<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $query = Recipe::query();

        if ($request->cuisine) {
            $query->where('cuisine', $request->cuisine);
        }
        if ($request->has('is_halal')) {
            $query->where('is_halal', (bool) $request->is_halal);
        }
        if ($request->has('is_vegetarian')) {
            $query->where('is_vegetarian', (bool) $request->is_vegetarian);
        }
        if ($request->has('is_vegan')) {
            $query->where('is_vegan', (bool) $request->is_vegan);
        }
        if ($request->has('is_ramadan_friendly')) {
            $query->where('is_ramadan_friendly', (bool) $request->is_ramadan_friendly);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('title_ar', 'like', "%{$request->search}%");
            });
        }

        $recipes = $query->with('user:id,name')->latest()->paginate(12);
        return response()->json($recipes);
    }

    public function show(Recipe $recipe)
    {
        return response()->json($recipe->load('user:id,name'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_ar' => 'nullable|string',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'ingredients' => 'required|array',
            'steps' => 'required|array',
            'steps_ar' => 'nullable|array',
            'prep_time' => 'nullable|integer',
            'cook_time' => 'nullable|integer',
            'servings' => 'nullable|integer',
            'cuisine' => 'required|string',
            'is_halal' => 'boolean',
            'is_vegetarian' => 'boolean',
            'is_vegan' => 'boolean',
            'is_ramadan_friendly' => 'boolean',
            'tags' => 'nullable|array',
        ]);

        $recipe = Recipe::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'is_community' => true,
        ]));

        return response()->json($recipe, 201);
    }

    public function save(Request $request, Recipe $recipe)
    {
        $user = $request->user();
        $user->savedRecipes()->syncWithoutDetaching([$recipe->id]);
        return response()->json(['message' => 'Recipe saved']);
    }

    public function unsave(Request $request, Recipe $recipe)
    {
        $request->user()->savedRecipes()->detach($recipe->id);
        return response()->json(['message' => 'Recipe removed from saved']);
    }

    public function saved(Request $request)
    {
        $recipes = $request->user()->savedRecipes()->with('user:id,name')->latest()->get();
        return response()->json($recipes);
    }

    public function like(Recipe $recipe)
    {
        $recipe->increment('likes');
        return response()->json(['likes' => $recipe->likes]);
    }
}
