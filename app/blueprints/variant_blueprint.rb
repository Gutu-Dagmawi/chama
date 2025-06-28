# frozen_string_literal: true

class VariantBlueprint < Blueprinter::Base
  identifier :id

  fields :sku, :color, :size, :variant_stock

  field :images do |variant, _opts|
    variant.images.map do |img|
      Rails.application.routes.url_helpers.rails_blob_url(img, only_path: false)
    end
  end
end
