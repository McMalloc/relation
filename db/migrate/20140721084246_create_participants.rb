class CreateParticipants < ActiveRecord::Migration
  def change
    create_table :participants do |t|
      t.string :name
      t.integer :persona_id

      t.timestamps
    end
  end
end
