class CreateMarkers < ActiveRecord::Migration
  def change
    create_table :markers do |t|
      t.string :code
      t.string :severity
      t.integer :position
      t.belongs_to :recording
      
      t.timestamps
    end
  end
end