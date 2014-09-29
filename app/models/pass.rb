class Pass < ActiveRecord::Base
  belongs_to :task
  belongs_to :participant
  belongs_to :prototype
  belongs_to :project
  has_many :markers
  has_one :recording
  
  def marker_count
    Marker.where(pass_id: self.id).count
  end
  
  def get_marker
    Marker.where(pass_id: self.id)
  end
  
  def get_specific_marker(marker_name) 
    Marker.where(pass_id: self.id, code: marker_name)
  end
end
