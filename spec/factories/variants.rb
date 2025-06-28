FactoryBot.define do
  factory :variant do
    sku { "MyString" }
    color { "MyString" }
    size { 1 }
    product { nil }
    stock { 1 }
  end
end
