class MarkerSerializer < ActiveModel::Serializer
  attributes :id, :code, :position, :severity, :pass_id
end
