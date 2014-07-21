class AddPersonas < ActiveRecord::Migration
  def change
    add_column :participants, :persona_id, :integer
  end
end
