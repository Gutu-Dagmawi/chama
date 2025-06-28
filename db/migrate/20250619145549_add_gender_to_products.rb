class AddGenderToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :gender, :string, null: false
  end
end
