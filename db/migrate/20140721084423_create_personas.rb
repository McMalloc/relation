class CreatePersonas < ActiveRecord::Migration
  def change
    create_table :personas do |t|
      t.string :moniker
      t.string :description

      t.timestamps
    end
  end
end
