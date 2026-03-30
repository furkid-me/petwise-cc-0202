import json

def classify_pet_type(usage_text):
    if not usage_text:
        return None
    
    text = str(usage_text).lower()
    
    dog_keywords = ['狗', '犬', 'dog', 'pupp', '汪汪', '汪星', '愛犬', 'puppy', 'canine', 'dogfood', 'dog.', '犬類', '犬種', '狗類', '狗糧', '愛犬']
    cat_keywords = ['貓', 'cat', '喵', 'kitten', 'feline', 'meow', '愛貓', 'catfood', 'canned', '貓罐', '貓食', '貓用', '貓咪', '貓隻', '貓類', '成貓', '老貓', '幼貓', '全貓', '母貓', '種貓', '全貓']
    other_keywords = ['鼠', '兔', '鳥', '倉鼠', '天竺鼠', '龍貓', '蜜袋鼯', '刺蝟', '貂', '烏龜', '龜', '蜥蜴', '守宮', '兩棲', '爬蟲', '魚', '蝦', '禽', '雀', '鴿', '鸚鵡', '小動物', '小寵', '草食', 'carn']
    
    has_dog = any(kw in text for kw in dog_keywords)
    has_cat = any(kw in text for kw in cat_keywords)
    has_other = any(kw in text for kw in other_keywords)
    
    # 同時有狗和貓
    if has_dog and has_cat:
        return 'dog_cat'
    elif has_dog:
        return 'dog'
    elif has_cat:
        return 'cat'
    elif has_other:
        return 'other_small_animal'
    
    return None

# 讀取清洗後的資料
with open('petfood_cleaned.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

stats = {}
tagged_data = []
unmatched = 0

for item in data['data']:
    usage = item.get('usage_pet', '')
    pet_type = classify_pet_type(usage)
    
    item['pet_type_ai'] = pet_type
    stats[pet_type] = stats.get(pet_type, 0) + 1
    
    if pet_type is None:
        unmatched += 1
    
    tagged_data.append(item)

print(f"總筆數: {len(data['data']}")
print(f"\n=== AI 分類結果 ===")
for k, v in sorted(stats.items(), key=lambda x: -x[1]):
    pct = v / len(data['data']) * 100
    print(f"  {k}: {v} ({pct:.1f}%)")

print(f"\n未匹配: {unmatched} 筆")

# 儲存結果
with open('petfood_final.json', 'w', encoding='utf-8') as f:
    json.dump({'total': len(tagged_data), 'data': tagged_data}, f, ensure_ascii=False, indent=2)

print(f"\n已儲存到 petfood_final.json")
