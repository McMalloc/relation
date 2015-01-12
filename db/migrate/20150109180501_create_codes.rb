class CreateCodes < ActiveRecord::Migration
  def change
    create_table :codes do |t|
      t.string :tag
      t.string :description
      t.string :color

      t.timestamps
    end
  end
end
