class Project < ActiveRecord::Base
  has_many :prototypes
  has_many :tasks
end