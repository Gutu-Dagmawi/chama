class AddBrandToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :brand, :string
  end
end
