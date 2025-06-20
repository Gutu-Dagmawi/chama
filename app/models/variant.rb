class Variant < ApplicationRecord
  belongs_to :product, inverse_of: :variants
  has_many_attached :images
  validates :sku, :color, :size, presence: true
end
