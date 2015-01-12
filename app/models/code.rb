class Code < ActiveRecord::Base
  has_many :markers
  belongs_to :project
end
