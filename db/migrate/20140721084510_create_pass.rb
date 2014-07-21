class CreatePass < ActiveRecord::Migration
  def change
    create_table :pass do |t|
      t.integer :tasktime
      t.decimal :sum
      t.decimal :satisfaction
      t.boolean :completed
      t.belongs_to :task
      t.belongs_to :participant
      
      t.timestamps
    end
  end
end
