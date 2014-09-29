class PassSerializer < ActiveModel::Serializer
  attributes :id, :participant_id, :task_id, :prototype_id, :satisfaction, :completed, :tasktime, :markercounts, :project_id
  has_many :markers
  
  def satisfaction
    if object.satisfaction then
      object.satisfaction.round(1)
    end
  end
  
  def project_id
    object.prototype.project_id
  end
  
  def markercounts
    if object.markers then
      codes = ["ANGER", "LOST", "IRRITATION", "CONFUSION", "ANNOYANCE"]
      markercounts = {}
      markercounts["all"] = object.markers.count
      codes.each { |code| 
        markercounts[code] = object.markers.where(code: code).count 
      }
      markercounts
    end
  end
  
end
