class ParticipantSerializer < ActiveModel::Serializer
  attributes :id, :name, :persona_desc, :project_id
  
  #def project_id
  #  object.passes.first.prototype.project_id
  #end  
  
  def persona_desc
    if object.persona then
      object.persona.moniker
    else
      ""
    end
  end
end