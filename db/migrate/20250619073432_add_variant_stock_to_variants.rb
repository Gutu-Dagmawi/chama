class AddVariantStockToVariants < ActiveRecord::Migration[8.0]
  def change
    add_column :variants, :variant_stock, :integer, null: false, default: 0
  end
end
