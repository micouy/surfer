# bugs / mistakes

```Rust
#[serde(deserialize(tag = "method", content = "params"))]
struct Enum {
  Variant,
}
```

won't be deserialized properly from `{ "method": "Variant", "params": {} }`

make it `Variant {}`

---
