<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'cultural_background' => 'sometimes|nullable|string',
            'language' => 'sometimes|in:en,ar',
            'is_halal' => 'sometimes|boolean',
            'is_vegetarian' => 'sometimes|boolean',
            'is_vegan' => 'sometimes|boolean',
            'ramadan_mode' => 'sometimes|boolean',
            'allergies' => 'sometimes|array',
        ]);

        $user = $request->user();

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        $profileData = array_filter($validated, fn($key) => $key !== 'name', ARRAY_FILTER_USE_KEY);

        if ($user->profile) {
            $user->profile->update($profileData);
        } else {
            $user->profile()->create($profileData);
        }

        return response()->json($user->fresh()->load('profile'));
    }
}
