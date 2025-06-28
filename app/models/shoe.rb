class Shoe < Product
  accepts_nested_attributes_for :variants, allow_destroy: true
end
