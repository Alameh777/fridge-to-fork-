<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PantryItem;
use Illuminate\Http\Request;

class PantryController extends Controller
{
    public function index(Request $request)
    {
        $items = PantryItem::where('user_id', $request->user()->id)
            ->orderByRaw('expiry_date IS NULL, expiry_date ASC')
            ->get()
            ->map(fn($item) => array_merge($item->toArray(), [
                'days_until_expiry' => $item->days_until_expiry,
            ]));

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'quantity'          => 'nullable|numeric|min:0',
            'unit'              => 'nullable|string|max:50',
            'expiry_date'       => 'nullable|date',
            'barcode'           => 'nullable|string|max:50',
            'brand'             => 'nullable|string|max:255',
            'calories_per_100g' => 'nullable|integer|min:0',
        ]);

        $item = PantryItem::create(array_merge($data, [
            'user_id' => $request->user()->id,
        ]));

        return response()->json(array_merge($item->toArray(), [
            'days_until_expiry' => $item->days_until_expiry,
        ]), 201);
    }

    public function update(Request $request, PantryItem $pantryItem)
    {
        if ($pantryItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'quantity'          => 'sometimes|numeric|min:0',
            'unit'              => 'sometimes|string|max:50',
            'expiry_date'       => 'sometimes|nullable|date',
            'barcode'           => 'sometimes|nullable|string|max:50',
            'brand'             => 'sometimes|nullable|string|max:255',
            'calories_per_100g' => 'sometimes|nullable|integer|min:0',
        ]);

        $pantryItem->update($data);

        return response()->json(array_merge($pantryItem->fresh()->toArray(), [
            'days_until_expiry' => $pantryItem->fresh()->days_until_expiry,
        ]));
    }

    public function destroy(Request $request, PantryItem $pantryItem)
    {
        if ($pantryItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pantryItem->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function expiringSoon(Request $request)
    {
        $items = PantryItem::where('user_id', $request->user()->id)
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '<=', now()->addDays(5))
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($item) => array_merge($item->toArray(), [
                'days_until_expiry' => $item->days_until_expiry,
            ]));

        return response()->json($items);
    }
}
