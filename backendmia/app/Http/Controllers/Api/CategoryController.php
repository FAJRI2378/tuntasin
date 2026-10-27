<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:categories,name|max:255']);
        $category = Category::create(['name' => $request->name]);
        return response()->json(['message' => 'Kategori dibuat', 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255|unique:categories,name,' . $id]);
        $category->update(['name' => $request->name]);
        return response()->json(['message' => 'Kategori diperbarui', 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Kategori dihapus']);
    }
}