class Task < ActiveRecord::Base
  has_many :participants, through: :passes
  has_many :markers
  has_many :passes
  has_one :project
end
