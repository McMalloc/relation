class AddAttachmentRecordingToPasses < ActiveRecord::Migration
  def self.up
    change_table :passes do |t|
      t.attachment :recording
    end
  end

  def self.down
    remove_attachment :passes, :recording
  end
end
