class TaskSerializer < ActiveModel::Serializer
  attributes :id, :name, :project_id
end