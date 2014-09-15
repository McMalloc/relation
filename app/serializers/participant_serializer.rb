class ParticipantSerializer < ActiveModel::Serializer
  attributes :id, :name, :persona_desc
  
  def persona_desc
    if object.persona then
      object.persona.moniker
    else
      ""
    end
  end
end