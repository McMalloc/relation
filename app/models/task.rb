class Task < ActiveRecord::Base
  has_many :participants, through: :passes
  has_many :passes
  belongs_to :project
end
