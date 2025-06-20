class Product < ApplicationRecord
  belongs_to :category
  has_many :variants, inverse_of: :product

  enum :gender, male: "male", female: "female", unisex: "unisex", kids: "kids"
  validates :name, :base_price, :brand, :gender, :category_id, presence: true

end
