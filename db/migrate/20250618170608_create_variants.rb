class CreateVariants < ActiveRecord::Migration[8.0]
  def change
    create_table :variants do |t|
      t.references :product, type: :uuid, null: false, foreign_key: true
      t.string :sku, null: false
      t.string :color, null: false
      t.integer :size, null: false
      t.decimal :price_modifier

      t.timestamps
    end
  end
end
