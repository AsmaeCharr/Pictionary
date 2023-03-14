<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('words', function (Blueprint $table) {
            $table->id();
            $table->string('name') -> unique();
            $table->string('description') -> nullable();

            $table->bigInteger('category_id')->unsigned()->index();

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->enum('difficulty', ['easy', 'medium', 'hard']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('words');
    }
};
