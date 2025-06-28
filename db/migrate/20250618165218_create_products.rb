class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products, id: :uuid do |t|
      t.string :type, null: false
      t.string :name, null: false
      t.text :description
      t.decimal :base_price

      t.timestamps
    end
  end
end
