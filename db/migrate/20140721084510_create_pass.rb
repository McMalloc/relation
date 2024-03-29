class CreatePass < ActiveRecord::Migration
  def change
    create_table :passes do |t|
      t.integer :tasktime
      t.decimal :sum
      t.decimal :satisfaction
      t.boolean :completed
      t.belongs_to :task
      t.belongs_to :participant
      t.belongs_to :prototype
      
      t.timestamps
    end
  end
end
