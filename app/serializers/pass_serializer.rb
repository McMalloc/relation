class PassSerializer < ActiveModel::Serializer
  attributes :id, :participant_id, :task_id, :prototype_id, :satisfaction, :completed, :tasktime, :markercounts
  has_many :markers
  
  def satisfaction
    object.satisfaction.round(1)
  end
  
  def markercounts
    codes = ["ANGER", "LOST", "IRRITATION", "CONFUSION", "ANNOYANCE"]
    markercounts = {}
    markercounts["all"] = object.markers.count
    codes.each { |code| 
      markercounts[code] = object.markers.where(code: code).count 
    }
    markercounts
  end
end
