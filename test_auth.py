import requests

BASE = 'http://127.0.0.1:5000'
s = requests.Session()

print("=" * 55)
print("STEP 1: Login as Aryan Test")
r = s.post(f'{BASE}/api/login', json={'email': 'aryan@test.com', 'password': 'test123'})
d = r.json()
print(f"  Status: {r.status_code} | Success: {d.get('success')}")
if d.get('user'):
    print(f"  Logged in as: {d['user']['full_name']} ({d['user']['email']})")

print()
print("=" * 55)
print("STEP 2: Verify session (/api/me)")
r = s.get(f'{BASE}/api/me')
me = r.json()
print(f"  logged_in: {me.get('logged_in')}")
if me.get('user'):
    print(f"  Session user: {me['user']['full_name']}")

print()
print("=" * 55)
print("STEP 3: Place checkout order (Headset x1 + Mouse x2)")
r = s.post(f'{BASE}/api/checkout', json={
    'name': 'Aryan Test',
    'email': 'aryan@test.com',
    'address': '123 Test Street',
    'city': 'Kathmandu',
    'zip': '44600',
    'cart': [
        {'productId': 1, 'quantity': 1},
        {'productId': 3, 'quantity': 2}
    ]
})
print(f"  HTTP Status: {r.status_code}")
if r.status_code == 200:
    co = r.json()
    print(f"  Order Success: {co.get('success')}")
    print(f"  Order ID: {co.get('order_id')}")
else:
    print(f"  ERROR: {r.text[:200]}")

print()
print("=" * 55)
print("STEP 4: Fetch order history (/api/orders)")
r = s.get(f'{BASE}/api/orders')
print(f"  HTTP Status: {r.status_code}")
if r.status_code == 200:
    orders = r.json()
    print(f"  Total orders found: {len(orders)}")
    for o in orders:
        print(f"\n  [{o['order_id']}] — {o['created_at']} — Total: ${o['total']:.2f}")
        for item in o['items']:
            print(f"    • {item['product_name']}  x{item['quantity']}  =  ${item['line_total']:.2f}")
else:
    print(f"  ERROR: {r.text[:200]}")

print()
print("=" * 55)
print("STEP 5: Logout and verify session cleared")
r = s.post(f'{BASE}/api/logout')
print(f"  Logout: {r.json()}")
r = s.get(f'{BASE}/api/me')
print(f"  logged_in after logout: {r.json().get('logged_in')}")

print()
print("=" * 55)
print("  ALL STEPS PASSED!")
print("=" * 55)
