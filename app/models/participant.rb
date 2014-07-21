class Participant < ActiveRecord::Base
  has_many :tasks, through: :pass
  has_many :pass
  has_one :persona
end
