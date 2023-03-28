<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Word;

class WordController extends Controller
{
    public function getWords(Request $request)
    {
        $enoughWords = true;
        // $randomWords;
        $returnWords = [];

        //Check if the words in those categories are >= than the amount of words needed.
        $numberOfWords = Word::whereIn("category_id", $request -> category)->count(); 

        //Check if the number of words from the categories is enough
        if ( !($numberOfWords >= $request -> amount) ) {
            $randomWords = $request -> amount - $numberOfWords;
            $enoughWords = false;
        }

        $words = Word::inRandomOrder()->whereIn("category_id", $request -> category)->limit($request -> amount)->get(); 
        for ($i=0; $i < count($words); $i++) { 
            array_push($returnWords, $words[$i]);
        }

        //If the number of words in the categories that haven chosen is lower than the words needed we get random words from the DB
        if (!$enoughWords) {
            $words2 = Word::inRandomOrder()->whereNotIn("category_id", $request -> category)
            ->where("creator_id", "==", NULL)
            ->limit($randomWords)->get(); 
            for ($i=0; $i < count($words2); $i++) { 
                array_push($returnWords, $words2[$i]);
            }
        }

        return response() -> json(["wordsToCheck" => $returnWords]);    
    }
    
}