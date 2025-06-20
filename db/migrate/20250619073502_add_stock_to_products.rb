class AddStockToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :stock, :integer, null: false, default: 0
  end
end
