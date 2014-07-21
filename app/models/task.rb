class Task < ActiveRecord::Base
  has_many :participants, through: :pass
  has_many :markers
  has_many :pass
  has_one :project
end
