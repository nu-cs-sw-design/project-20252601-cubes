from enum import Enum
from collections import Counter
import random
import os


class Color(Enum):
    GREEN = "🟩"
    YELLOW = "🟨"
    GRAY = "⬜"


def evaluate_guess(guess: str, target: str):
    word_length = len(target)
    if word_length != len(guess):
        return []

    result = [None] * word_length
    target_letter_count = Counter(target)

    for i in range(word_length):
        if guess[i] == target[i]:
            result[i] = Color.GREEN.value
            target_letter_count[guess[i]] -= 1

    for i in range(word_length):
        if result[i] == Color.GREEN.value:
            continue

        if target_letter_count[guess[i]] > 0:
            result[i] == Color.YELLOW.value
            target_letter_count[guess[i]] -= 1
        else:
            result[i] = Color.GRAY.value

    return result


def format_guess_result(result):
    a = ""
    for i in result:
        a += i

    return a


def get_random_word(file):
    dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(dir, file)
    with open(file_path, 'r') as f:
        words = set(f.read().splitlines())
    return random.choice(list(words)).upper()


word = get_random_word("words.txt")
print(word)

# a = evaluate_guess("HLOWN", "FROWN")
# print(format_guess_result(a))
