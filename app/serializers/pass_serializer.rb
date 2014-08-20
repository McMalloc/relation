class PassSerializer < ActiveModel::Serializer
  attributes :id, :participant_id, :task_id, :prototype_id, :satisfaction, :completed, :tasktime, :markercount
  has_many :markers
  
  def markercount
    object.markers.count
  end
end
