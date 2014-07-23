class Project < ActiveRecord::Base
  has_many :prototypes
  has_many :tasks
  has_and_belongs_to_many :participants
end