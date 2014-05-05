import daemon
import logging
import os
import shutil
import tarfile
import time
from config import SnapConfig

class SnapSet(object):
	'''
	Back up changes in real time to multipal destinations
	'''
	dict_free_size = {}
	def __init__(self, src=None, dest=None, git=False,
		     compress=False, dryrun=False):
		if src != None or dest != None:
			self.src = src
			self.dest = dest
			self.git = git
			self.compress = compress
		else:
			self.src, self.dest, self.git, self.compress = self._load_config("./test.ini")

	def _load_config(self, name): 
		c = SnapConfig()
		c.read(name)
		src = c.ConfigSectionMap("main")['source']
		dest = c.ConfigSectionMap("main")['destination']
		git = c.getboolean("main", "git")
		compress = c.getboolean("main", "compress")
		srcs = [ x.strip() for x in src.split(',') ]
		# Ignore the destination if it is not a directory
		tmp_dests = [ x.strip() for x in dest.split(',') ]
		dests = [ x for x in tmp_dests if os.path.isdir(x) ]
		return [srcs, dests, git, compress]

	def _total_size(self, source):
		total_size = os.path.getsize(source)
		for item in os.listdir(source):
		    itempath = os.path.join(source, item)
		    if os.path.isfile(itempath):
			total_size += os.path.getsize(itempath)
		    elif os.path.isdir(itempath):
			total_size += self._total_size(itempath)
		return total_size

	def add_source(self, name):
		pass

	def add_destination(self, name):
		pass

	# Support multiple destinations
	# Return a dict
	def get_free_size(self, *args):
		dict_disk_ratio = self.get_disk_ratio(args[0])
		for path in args[0]:
			# Handle links correctly
			p = os.path.realpath(os.path.abspath(path))
			dstat = os.statvfs(p)
			self.dict_free_size[path] = dstat.f_bavail * dstat.f_frsize / dict_disk_ratio[path]
		return self.dict_free_size

	def get_disk_ratio(self, *args):
		dict_disk_ratio = {}
		for path in args[0]:
			p = os.path.realpath(os.path.abspath(path))
			dict_disk_ratio[path] = os.stat(p).st_dev
		temp = {x:dict_disk_ratio.values().count(x) for x in dict_disk_ratio.values()}
		for k, v in dict_disk_ratio.items():
			if v in temp.keys():
				dict_disk_ratio[k] = temp[v]
		return dict_disk_ratio

	# Return at least one of the available destinations
	def get_available_dest(self, *args):
		src_total_size = 0
		for path in args[0]:
			if os.path.isfile(path):
				src_total_size = src_total_size + os.path.getsize(path)
			elif os.path.exists(path):
				p = os.path.realpath(os.path.abspath(path))
				src_total_size = src_total_size + self._total_size(path)
			else:
				raise ValueError
			print src_total_size
			for k, v in self.dict_free_size.items():
				if v <= src_total_size:
					del self.dict_free_size[k]
		return self.dict_free_size

	#def start(self, src, dest, git, compress, dryrun):
	def start(self, **kwargs):
		d = self.get_free_size(self.dest)
		available_dest = self.get_available_dest(self.src)
		f = open("/tmp/sysnapshot.log", "a+")
		f.write(str(d))
		f.write(str(available_dest))
		time.sleep(1)
		if self.compress:
			tmpfile = "/tmp/tartest.tar.gz"
			tar = tarfile.open(tmpfile,"w:gz")
		else:
			tmpfile = "/tmp/tartest.tar"
			tar = tarfile.open(tmpfile, "w")
		for src in self.src:
			tar.add(src)
		tar.close()
		for dest in self.dest:
			try:
				shutil.copy2(tmpfile, dest)
			except:
				pass
		os.remove(tmpfile)

if __name__ == "__main__":

	logger = logging.getLogger("sysnapshot")
	logger.setLevel(logging.DEBUG)
	logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)

	#with daemon.DaemonContext():
	s = SnapSet()
	s.start()
