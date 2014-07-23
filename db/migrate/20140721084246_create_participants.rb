class CreateParticipants < ActiveRecord::Migration
  def change
    create_table :participants do |t|
      t.string :name
      t.belongs_to :persona

      t.timestamps
    end
  end
end
