import urllib.request
import json
import sys

url = "http://127.0.0.1:8000/questions?track=ICSE9&type=type_confusion&sub_type=rule_3"
print(f"Sending GET request to {url}")
try:
    with urllib.request.urlopen(url, timeout=5) as response:
        status = response.status
        body = response.read().decode('utf-8')
        print(f"Response Status: {status}")
        data = json.loads(body)
        print(f"Returned {len(data)} questions:")
        for i, q in enumerate(data):
            content = q.get('content', {})
            expr = content.get('expression', '')
            correct = q.get('correct_answer', '')
            print(f"{i+1}. Expression: {expr} | Answer: {correct}")
except Exception as e:
    print(f"Error calling API: {e}", file=sys.stderr)
    sys.exit(1)
