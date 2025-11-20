from enum import Enum 
from collections import Counter

def evaluate_guess(guess:str, target:str):
    word_length = len(target)
    if word_length != len(guess):
        return []

    result = [None] * word_length
    target_letter_count = Counter(target)

    for i in range(word_length):
        if guess[i] == target[i]:
            result[i] = "GREEN"
            target_letter_count[guess[i]] -= 1
    
    for i in range(word_length):
        if result[i] == "GREEN":
            continue

        if target_letter_count[guess[i]] > 0:
            result[i] == "YELLOW"
            target_letter_count[guess[i]] -= 1
        else:
            result[i] = 'GRAY'

    return result

a = evaluate_guess("HELLO", "FROWN")
print(a)
