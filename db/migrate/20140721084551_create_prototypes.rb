class CreatePrototypes < ActiveRecord::Migration
  def change
    create_table :prototypes do |t|
      t.string :moniker
      t.belongs_to :project

      t.timestamps
    end
  end
end
