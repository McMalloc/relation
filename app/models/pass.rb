class Pass < ActiveRecord::Base
  belongs_to :task
  belongs_to :participant
  belongs_to :prototype
  has_many :markers
  has_one :recording
end
