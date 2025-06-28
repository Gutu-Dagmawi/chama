# frozen_string_literal: true

class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :type, :base_price, :description, :brand, :gender, :stock

  association :variants, blueprint: VariantBlueprint
end
