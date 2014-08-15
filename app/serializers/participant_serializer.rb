class ParticipantSerializer < ActiveModel::Serializer
  attributes :id, :name, :persona_desc
  
  def persona_desc
    object.persona.moniker
  end
end