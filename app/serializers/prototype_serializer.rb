class PrototypeSerializer < ActiveModel::Serializer
  attributes :id, :moniker, :project_id
  has_many :passes
end