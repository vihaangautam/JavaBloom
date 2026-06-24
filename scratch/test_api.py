import urllib.request
import json

tracks = ["ICSE9", "ICSE10", "APCSA"]

for track in tracks:
    url = f"http://127.0.0.1:8000/questions?track={track}&type=flashcard"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"\n--- Track: {track} ---")
            print(f"Total flashcards: {len(data)}")
            
            # Count by chapter
            ch_counts = {}
            for q in data:
                ch_title = q.get('chapter_title', 'No Chapter')
                ch_counts[ch_title] = ch_counts.get(ch_title, 0) + 1
            
            for ch_title, count in sorted(ch_counts.items()):
                print(f"  * {ch_title}: {count} cards")
                
            # Sample first card
            if data:
                sample = data[0]
                print(f"  * Sample Card Front: {sample['content']['front']}")
                print(f"  * Sample Card Back: {sample['content']['back']}")
    except Exception as e:
        print(f"Error checking {track}: {e}")
